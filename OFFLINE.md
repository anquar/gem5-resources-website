```bash
docker build --no-cache -t gem5-resources-offline .
docker run -d -p 8080:80 gem5-resources-offline
docker stop $(docker ps -q --filter ancestor=gem5-resources-offline)
```