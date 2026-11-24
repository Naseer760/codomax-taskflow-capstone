# CODOMAX Cloud & DevOps Capstone — TaskFlow

A separate, beginner-friendly full-stack capstone project for Module 06. TaskFlow is a small task-management web application with:
- HTML/CSS/JavaScript frontend served by Nginx
- Node.js + Express REST API
- MySQL database with persistent Docker volume
- Docker Compose orchestration
- GitHub Actions CI (tests + Docker image builds)
- Optional automated deployment to an AWS EC2 instance
- Health endpoint and container/application logs

## Architecture

Browser → Nginx frontend (`:80`) → Express API (`/api/*`) → MySQL (`:3306`)

GitHub → GitHub Actions (test + build) → SSH deployment to EC2 → Docker Compose

## Requirements
- Git and GitHub account
- Docker Desktop (Windows) or Docker Engine + Compose plugin (EC2)
- Node.js 20+ (only needed to run tests locally)
- AWS account for the cloud deployment stage

## Run locally with Docker Compose

1. Copy `.env.example` to `.env`.
2. Change all sample passwords in `.env`.
3. From this directory run:

```bash
docker compose up -d --build
docker compose ps
```

4. Open `http://localhost`.
5. Test API health at `http://localhost/api/health`.
6. Add a task in the browser, refresh the page, and confirm it remains.

Useful commands:

```bash
docker compose logs -f
docker compose logs -f backend
docker compose exec database mysql -u taskflow -p taskflow
docker compose down
docker compose down -v   # WARNING: deletes the database volume and its data
```

## Run backend tests locally

```bash
cd backend
npm install
npm test
```

## GitHub setup

Create a GitHub repository named `codomax-cloud-devops-capstone`, then:

```bash
git init
git add .
git commit -m "Initial TaskFlow capstone"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/codomax-cloud-devops-capstone.git
git push -u origin main
```

Never commit `.env`, SSH private keys, AWS credentials, or passwords.

## AWS EC2 deployment

Use an Ubuntu 22.04/24.04 or Amazon Linux 2023 EC2 instance. A small instance may be resource-constrained; avoid running unnecessary services. Allow inbound TCP 22 from your own IP and TCP 80 from the internet. Add TCP 443 only after configuring HTTPS. Do not expose MySQL port 3306 publicly.

Install Git and Docker using the official instructions for your chosen OS. Verify:

```bash
git --version
docker --version
docker compose version
```

Clone the repository:

```bash
git clone https://github.com/YOUR-USERNAME/codomax-cloud-devops-capstone.git
cd codomax-cloud-devops-capstone
cp .env.example .env
nano .env
```

Set strong unique production passwords in `.env`, then:

```bash
docker compose up -d --build
docker compose ps
curl http://localhost/api/health
```

Open `http://YOUR_EC2_PUBLIC_IPV4` in a browser.

### Optional GitHub Actions auto-deploy

This repository includes `.github/workflows/deploy.yml`. It deploys only after a push to `main`, once CI passes. In GitHub → Settings → Secrets and variables → Actions, add:

- `EC2_HOST`: EC2 public IPv4 or DNS
- `EC2_USER`: SSH username (`ubuntu` or `ec2-user`, depending on AMI)
- `EC2_SSH_KEY`: contents of a dedicated private SSH key authorized on the EC2 instance

The workflow assumes the project is cloned at `/home/ubuntu/codomax-cloud-devops-capstone` for Ubuntu. For Amazon Linux, either create that path and use a suitable deployment user or edit `DEPLOY_PATH` in the workflow to `/home/ec2-user/codomax-cloud-devops-capstone`. The SSH user must be able to run Docker Compose (configure Docker permissions carefully; the workflow uses `sudo`).

For a safer setup, use a dedicated deploy key, restrict SSH source access where practical, and do not use your personal/root key. Never paste a private key into chat or commit it to GitHub.

## Deliverables to capture for CODOMAX

1. GitHub repository page
2. `docker compose ps` showing frontend, backend and database running
3. Browser showing TaskFlow
4. Successful task creation and persistence after refresh
5. GitHub Actions green CI run
6. EC2 security group showing SSH restricted to your IP and HTTP enabled
7. Live EC2 website and `/api/health`
8. `docker compose logs` and `docker stats`
9. Architecture diagram (see `docs/architecture.md`)
10. Final README and a short LinkedIn post

## Troubleshooting

- Port 80 already in use: stop the conflicting service or change the host mapping in `docker-compose.yml`.
- Backend cannot connect to MySQL: check `.env`, `docker compose logs database`, and wait for the database health check.
- Browser cannot reach API: confirm Nginx proxy configuration and that frontend calls `/api`.
- EC2 website unavailable: verify instance status, public IPv4, security-group inbound rules, and `docker compose ps`.
- Data disappeared: do not run `docker compose down -v`; the named volume stores MySQL data.

## Security notes
This is an educational capstone, not a production-hardened system. Before real production use, add authentication/authorization, HTTPS, input rate limiting, backups, secret rotation, and stronger database/network isolation.
