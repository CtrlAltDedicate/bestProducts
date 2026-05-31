# Deployment Guide — Digital Ocean

## Step 1: Get Free Credits (GitHub Student Pack)

1. Go to https://education.github.com/pack
2. Sign in with your university GitHub account
3. Apply — approval takes 1–3 days
4. Once approved, redeem $200 Digital Ocean credit at https://www.digitalocean.com/github-students

---

## Step 2: Create a Droplet

1. Log in to https://cloud.digitalocean.com
2. Click **Create → Droplets**
3. Settings:
   - **Image**: Ubuntu 22.04 LTS
   - **Plan**: Basic — $6/mo (1 vCPU, 1GB RAM) is enough
   - **Region**: Frankfurt or London (nearest to UK)
   - **Authentication**: SSH Key (add your public key)
4. Click **Create Droplet**
5. Note the Droplet's IP address

---

## Step 3: Connect to Your Droplet

```bash
ssh root@<your-droplet-ip>
```

---

## Step 4: Install Dependencies on the Server

Run these commands on the Droplet:

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y docker.io docker-compose git
sudo systemctl enable docker
sudo systemctl start docker
sudo usermod -aG docker $USER
# Log out and back in for the group change to take effect
exit
```

---

## Step 5: Push Your Code to GitHub

On your local machine (run these in the `bestproducts/` directory):

```bash
git remote add origin https://github.com/<your-username>/bestproducts.git
git push -u origin main
```

---

## Step 6: Clone and Configure on the Server

```bash
ssh root@<your-droplet-ip>

git clone https://github.com/<your-username>/bestproducts.git
cd bestproducts

# Create production .env from the template
cp .env.example .env
nano .env
```

Edit `.env` with **production values**:
```
DB_NAME=bestproducts
DB_USER=bestuser
DB_PASSWORD=<choose-a-strong-password>
DB_ROOT_PASSWORD=<choose-a-strong-root-password>
DB_HOST=db
DB_PORT=3306
DJANGO_SECRET_KEY=<generate-a-50-char-random-string>
DJANGO_DEBUG=False
ALLOWED_HOSTS=<your-droplet-ip>,yourdomain.com
CORS_ALLOWED_ORIGINS=http://<your-droplet-ip>
```

To generate a Django secret key:
```bash
python3 -c "import secrets; print(secrets.token_urlsafe(50))"
```

---

## Step 7: Deploy

```bash
docker-compose -f docker-compose.prod.yml up -d --build
```

This will:
1. Build the Django backend image
2. Build the React frontend (compiled to static files)
3. Start MySQL, backend (gunicorn), frontend (nginx), and the reverse proxy

---

## Step 8: Create a Superuser

```bash
docker-compose -f docker-compose.prod.yml exec backend python manage.py createsuperuser
```

---

## Step 9: Verify

- Visit `http://<your-droplet-ip>` — you should see the BestProducts login page
- Visit `http://<your-droplet-ip>/admin` — Django admin panel
- Visit `http://<your-droplet-ip>/api/products/` — should return 401 (auth required — correct)

---

## Useful Commands

```bash
# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Stop everything
docker-compose -f docker-compose.prod.yml down

# Restart after a code change
git pull
docker-compose -f docker-compose.prod.yml up -d --build

# Access Django shell
docker-compose -f docker-compose.prod.yml exec backend python manage.py shell
```

---

## Optional: Add a Domain Name

1. Buy a domain (Namecheap, Google Domains, etc.)
2. In your domain's DNS settings, add an **A record** pointing to your Droplet's IP
3. Update `.env`: `ALLOWED_HOSTS=yourdomain.com` and `CORS_ALLOWED_ORIGINS=http://yourdomain.com`
4. Redeploy

For HTTPS, install Certbot:
```bash
sudo apt install certbot
sudo certbot certonly --standalone -d yourdomain.com
```
Then update the nginx config to serve on port 443 with the certificates.
