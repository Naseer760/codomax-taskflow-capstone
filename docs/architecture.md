# TaskFlow architecture

```text
                  Internet / Browser
                         |
                      TCP 80
                         |
                  [ Nginx Frontend ]
                         |
                 /api/* reverse proxy
                         |
                  [ Express API ]
                         |
                     TCP 3306
                         |
                    [ MySQL ]
                         |
                 [ mysql_data volume ]

Developer → Git push → GitHub Actions
                         |
                 install + test + build
                         |
                 successful CI workflow
                         |
                  SSH deployment
                         |
                    AWS EC2
                         |
                  Docker Compose
```

## Components
- Nginx serves the static frontend and reverse-proxies `/api/` to the backend service.
- Express validates requests and accesses MySQL through parameterized queries.
- MySQL stores tasks; the named Docker volume persists database files.
- GitHub Actions runs Node tests and builds both Docker images.
- The deployment workflow connects to EC2 using repository secrets and restarts the Compose stack.
- Health check: `GET /api/health`.
