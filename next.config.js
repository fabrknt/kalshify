/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    transpilePackages: [
        "@fabrknt/ui",
        "@fabrknt/auth",
        "@fabrknt/db",
        "@fabrknt/api",
        "@fabrknt/blockchain",
    ],
    experimental: {
        serverActions: {
            bodySizeLimit: "2mb",
        },
    },
    webpack: (config, { isServer }) => {
        // Ignore React Native dependencies that MetaMask SDK tries to import
        if (!isServer) {
            config.resolve.fallback = {
                ...config.resolve.fallback,
                "@react-native-async-storage/async-storage": false,
                "react-native": false,
            };

            // Ignore React Native modules in node_modules
            config.resolve.alias = {
                ...config.resolve.alias,
                "@react-native-async-storage/async-storage": false,
            };
        }
        return config;
    },
};

module.exports = nextConfig;
