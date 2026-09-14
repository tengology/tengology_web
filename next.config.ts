import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [...["pink-pumpkin-felt-headband", "lavender-pumpkin-felt-headband", "blue-pumpkin-felt-headband", "purple-cream-pumpkin-felt-headband"].map(slug => ({
      source: `/product/${slug}`,
      destination: "/product/halloween-pumpkin-felt-headband",
      permanent: true,
    })), {
      source: "/product/strawberry-felt-headband-crimson",
      destination: "/product/strawberry-felt-headband-sage",
      permanent: true,
    }, {
      source: "/product/flower-headband",
      destination: "/product/lilac-rose-garden-felt-headband",
      permanent: true,
    }, {
      source: "/product/toadstool-buttercup-felt-hair-clip",
      destination: "/product/toadstool-daisy-felt-hair-clip",
      permanent: true,
    }, {
      source: "/product/pastel-blossom-statement-headband",
      destination: "/product/lilac-rose-garden-felt-headband",
      permanent: true,
    }];
  },
  // Emit a self-contained server bundle so the Docker image only needs
  // .next/standalone + .next/static + public, not the 1.2GB node_modules.
  output: "standalone",
  turbopack: {
    root: __dirname,
    rules: {
      // 3D model assets used by the jewellery preview.
      "*.{glb,gltf}": {
        loaders: ["file-loader"],
        as: "*.js",
      },
    },
    resolveAlias: {
      // Konva's Node entry pulls in the optional `canvas` package for headless
      // rendering. The designer only ever runs Konva in the browser, so point
      // the browser resolution at an empty module instead of shipping it.
      canvas: { browser: "./src/lib/empty-module.ts" },
    },
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "@react-three/drei"],
  },
};

export default nextConfig;
