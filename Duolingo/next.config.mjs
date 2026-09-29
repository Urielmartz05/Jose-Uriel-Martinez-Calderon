/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['sequelize', 'sqlite3', 'bcryptjs', 'pg', 'pg-hstore'],
};

export default nextConfig;
