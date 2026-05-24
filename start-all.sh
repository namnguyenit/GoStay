#!/bin/bash

SESSION_NAME="gostay"

echo "========================================="
echo "Khoi dong he thong GoStay"
echo "========================================="

# Kill session cu
tmux kill-session -t $SESSION_NAME 2>/dev/null

# Tao session moi
tmux new-session -d -s $SESSION_NAME

echo "Khoi dong PostgreSQL..."

tmux send-keys -t $SESSION_NAME "
sudo service postgresql start
" C-m

sleep 5

echo "Khoi dong Identity Service..."

tmux new-window -t $SESSION_NAME -n Identity

tmux send-keys -t $SESSION_NAME:1 "
cd /workspaces/GoStay/Identity && \
/usr/lib/jvm/java-17-openjdk-amd64/bin/java \
-Xms128m -Xmx512m \
-jar target/Identity-0.0.1-SNAPSHOT.jar \
> /workspaces/GoStay/identity.log 2>&1
" C-m

echo "Cho Spring Boot khoi dong..."
sleep 20

echo "Khoi dong API Gateway..."

tmux new-window -t $SESSION_NAME -n APIGateway

tmux send-keys -t $SESSION_NAME:2 "
cd /workspaces/GoStay/APIGateway && \
pm2 start server.js --name APIGateway --time
" C-m

echo "Khoi dong Cloudinary Service..."

tmux new-window -t $SESSION_NAME -n Cloudinary

tmux send-keys -t $SESSION_NAME:3 "
cd /workspaces/GoStay/cloudinary-service && \
pm2 start src/media-server.js --name CloudinaryService --time
" C-m

echo "Khoi dong Cloudflare Tunnel..."

tmux new-window -t $SESSION_NAME -n Tunnel

tmux send-keys -t $SESSION_NAME:4 "
cloudflared tunnel run gostay-api
" C-m

echo "Khoi dong KeepAlive..."

tmux new-window -t $SESSION_NAME -n KeepAlive

tmux send-keys -t $SESSION_NAME:5 "
while true; do
  echo \"still alive \$(date)\"
  sleep 240
done
" C-m

echo "========================================="
echo "He thong da khoi dong!"
echo ""
echo "TMUX:"
echo "tmux attach -t gostay"
echo ""
echo "PM2:"
echo "pm2 status"
echo ""
echo "Logs Spring Boot:"
echo "tail -f /workspaces/GoStay/identity.log"
echo ""
echo "Tunnel:"
echo "https://api.trungcaodev.io.vn"
echo "========================================="