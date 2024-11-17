## Getting Started

First, run the development server:

npm run dev

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### .env.development
NEXT_PUBLIC_GOOGLE_MAP_API_KEY=AIzaSyAmLKxnKyFoCKTmuKG6hb0Yt347Ab4gXjQ
NEXT_PUBLIC_NODE_SERVER_URL=http://localhost:8080
AUTH_SECRET=bb9u0srGafGVy5smDOkRZTtD0i74XOS5q45rTkinsRc=

REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_CACHE_GLOBAL_TIMEOUT=3600     #1 hour

AUTH_MAX_AGE=14400    #, // 4 hours
AUTH_UPDATE_AGE=36000     #10 * 60 * 60 // 10 hours

### .env.production
NEXT_PUBLIC_GOOGLE_MAP_API_KEY=AIzaSyAmLKxnKyFoCKTmuKG6hb0Yt347Ab4gXjQ
NEXT_PUBLIC_NODE_SERVER_URL=https://fleetcontrol.oldcrux.com
AUTH_SECRET=bb9u0srGafGVy5smDOkRZTtD0i74XOS5q45rTkinsRc=

REDIS_HOST=10.10.0.7
REDIS_PORT=6379
REDIS_CACHE_GLOBAL_TIMEOUT=3600     #1 hour

AUTH_MAX_AGE=14400    # // 4 hours
AUTH_UPDATE_AGE=36000     #10 * 60 * 60 // 10 hours

### Docker build and push
docker build --no-cache --platform linux/amd64 -t asia-south1-docker.pkg.dev/fleetcontrol-15092024/oldcruxrepo/nodeapp:latest .
docker push asia-south1-docker.pkg.dev/fleetcontrol-15092024/oldcruxrepo/nodeapp:latest