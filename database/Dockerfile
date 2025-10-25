FROM mysql:8.0

# Set environment variables
ENV MYSQL_ROOT_PASSWORD=financial_freedom_root
ENV MYSQL_DATABASE=financial_freedom
ENV MYSQL_USER=financial_user
ENV MYSQL_PASSWORD=financial_pass

# Copy initialization script
COPY init.sql /docker-entrypoint-initdb.d/

# Expose port
EXPOSE 3306

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD mysqladmin ping -h localhost -u root -p$MYSQL_ROOT_PASSWORD || exit 1
