/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['sequelize', 'sqlite3', 'bcryptjs'],
  },
};

export default nextConfig;
