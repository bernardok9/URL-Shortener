# URL-Shortener

## Instructions to Run Locally

1. Make sure you have [Docker](https://www.docker.com/get-started/) installed on your machine.

2. Rename the `.env.example` file to `.env`.  
   This file contains the environment variables required to run the project locally.

3. Start the application with the following command:  
   ```bash
   cd URL-Shortener/
   docker compose up --build
   ```
## API Link
- https://url-shortener-1qp8.onrender.com/

## Suggestions
### Redis
- Implement a cache manager for frequently accessed routes to reduce database load and improve response times by serving already fetched data.
- Implement jwt blacklist system to support logout/token revoke.
### Grafana
- Implement Grafana into the project to visualize and monitor metrics
