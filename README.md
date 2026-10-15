# aame-website

A static invitation site for the Chudakarma ceremony. Plain HTML, CSS, and JavaScript with no build step.

## Run locally

```bash
cd /Users/rnataraj/dev/aame-website
node server.js
```

Open http://localhost:3000. The Node server serves the site and the poll API. Requires Node 18 or newer.

Poll votes are saved to `data/votes.json` (a key-value file like `{"Look 1": 3}`). Download them as a CSV for Excel at http://localhost:3000/api/votes.csv. The page visit count is saved to `data/visits.json`.

## Deploy on a server (Ubuntu/Debian with nginx)

**1. Install nginx and git**

```bash
sudo apt update
sudo apt install -y nginx git
```

**2. Clone the repo into the web root**

```bash
sudo mkdir -p /var/www
sudo git clone <your-repo-url> /var/www/aame-website
sudo chown -R www-data:www-data /var/www/aame-website
```

**3. Create the nginx site config**

Create `/etc/nginx/sites-available/arsimha.click`:

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name arsimha.click www.arsimha.click;

    root /var/www/aame-website;
    index index.html;

    location / {
        try_files $uri $uri/ =404;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
    }
}
```

The `/api/` block sends poll requests to the Node server in step 8.

Enable it and reload nginx:

```bash
sudo ln -s /etc/nginx/sites-available/arsimha.click /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx
```

**4. Point DNS at the server**

Find the server's public IP in Akamai Cloud Manager under **Linodes**, then select the VM. The IP is on the **Summary** tab under **IP Addresses**.

Then add the DNS records where the domain's DNS is managed. For a domain bought from Spaceship:

1. Log in to Spaceship and go to **Domains**, then click the domain.
2. Open the DNS records section (the label may be **DNS Records** or **Advanced DNS**).
3. Add these records:

| Type | Host | Value | TTL |
|---|---|---|---|
| A | @ | your server's public IP | Default |
| A | www | your server's public IP | Default |

4. Remove any existing `@` or `www` records that point elsewhere, such as parking page records.
5. Save the changes.

If the domain uses custom nameservers instead of Spaceship DNS, add the records at the provider that hosts the nameservers.

DNS changes can take from a few minutes to a few hours. Check with `dig +short arsimha.click` and `dig +short www.arsimha.click`. Both should show the server IP before running certbot in step 6.

**5. Open the firewall**

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

If the server is behind a home router, forward ports 80 and 443 to the server's local IP.

**6. Enable HTTPS**

Run this after DNS resolves to the server:

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d arsimha.click -d www.arsimha.click
```

Certbot renews the certificate automatically. Check renewal with `sudo certbot renew --dry-run`.

**7. Harden the server**

```bash
sudo apt install -y unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

Disable SSH password login in `/etc/ssh/sshd_config` (set `PasswordAuthentication no`, use SSH keys), then run `sudo systemctl restart ssh`.

**8. Run the poll server**

Install Node.js (Ubuntu/Debian ships an old version, so use NodeSource or a version manager for 18 or newer), then create a systemd service at `/etc/systemd/system/aame-poll.service`:

```ini
[Unit]
Description=Chudakarma poll server
After=network.target

[Service]
WorkingDirectory=/var/www/aame-website
ExecStart=/usr/bin/node server.js
Environment=PORT=3000
Restart=always
User=www-data

[Install]
WantedBy=multi-user.target
```

Start it and reload nginx:

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now aame-poll
sudo nginx -t && sudo systemctl reload nginx
```

The `www-data` user must be able to write `/var/www/aame-website/data`. Create it with `sudo mkdir -p /var/www/aame-website/data && sudo chown www-data:www-data /var/www/aame-website/data`.

## Update the site

**1. Push the change from your Mac**

```bash
cd /Users/rnataraj/dev/aame-website
git add <changed files>
git commit -m "Describe the change"
git push
```

**2. Pull the change on the server**

```bash
cd /var/www/aame-website && sudo git pull
```

**3. Restart the poll service only if `server.js` changed**

```bash
sudo systemctl restart aame-poll
```

Static files such as `index.html`, `script.js`, and `styles.css` are served directly, so they need no restart. Nginx does not need a restart either. Reload the page with Cmd+Shift+R to clear the browser cache.

`data/` is not tracked by git, so `git pull` does not change it. Back up `data/votes.json` and `data/visits.json` before major changes.

## Troubleshooting

- Check nginx errors: `sudo tail -f /var/log/nginx/error.log`
- Check DNS: `dig +short arsimha.click` should return the server IP.

## Security notes

- The RSVP form uses `mailto:`, so no guest data is stored on the server.
- HTTPS protects traffic in transit. Only ports 22, 80, and 443 should be open.
- The site is public. Anyone with the link can see the photos of the child. Share the link only with family and friends.
- Keep the OS and nginx updated (`unattended-upgrades` handles security patches).
