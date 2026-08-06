FROM node:22-bookworm

# Install dependensi sistem untuk canvas, font tebal, dan emoji
RUN apt-get update && apt-get install -y \
    build-essential \
    pkg-config \
    libcairo2-dev \
    libpango1.0-dev \
    libjpeg-dev \
    libgif-dev \
    librsvg2-dev \
    libpixman-1-dev \
    fonts-liberation \
    fonts-noto-color-emoji \
    fontconfig \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files dan install dependensi
COPY package*.json ./
RUN npm install

# Copy seluruh kode bot
COPY . .

# Jalankan bot
CMD ["node", "index.js"]
