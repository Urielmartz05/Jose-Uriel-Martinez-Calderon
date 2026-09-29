/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['sequelize', 'sqlite3', 'bcryptjs'],
};

export default nextConfig;
