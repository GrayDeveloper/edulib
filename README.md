![Logo](/GRAPHICS/logoLight.svg)

# EduLIB

📚 EduLIB is a modern, web-based library management system designed for schools. It features an intuitive interface, simple setup, and seamless deployment using Docker.

[![Next.js](https://img.shields.io/badge/Next.js-black?logo=next.js)](https://nextjs.org/)

[![Express.js](https://img.shields.io/badge/Express-black?logo=express)](https://expressjs.com/)

[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-black?logo=tailwindcss)](https://tailwindcss.com/)

[![Docker](https://img.shields.io/badge/Docker-black?logo=Docker)](https://www.docker.com/)

## Documentation

[Documentation](/DOCS/README.md)

## Deployment

Getting started is easy. Just follow these steps:

Clone the repository:

```bash
git clone https://github.com/GrayDeveloper/edulib.git
cd edulib
```

Configure your environment variables, using the provided `.env` files as templates:

`./BACKEND/.env`

`./FRONTEND/.env`

Deploy using Docker:

```bash
docker compose up --build
```

This will launch:

- Frontend (Next.js)
- Backend (Express.js)
- Database (MariaDB)
- NGINX reverse proxy

## Development mode

Clone the repo and install dependencies for each service:

```bash
cd BACKEND
npm install
npm run dev
```

```bash
cd FRONTEND
npm install
npm run dev
```

You'll need to have a running MariaDB or MySQL server. You can use _XAMPP_ or a Docker-based database.

## Authors

- [@GrayDeveloper](https://www.github.com/GrayDeveloper)
- [@Szabojazmin253](https://www.github.com/Szabojazmin253)
