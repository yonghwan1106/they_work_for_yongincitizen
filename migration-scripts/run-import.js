// Temporary wrapper to run import with credentials
process.env.POCKETBASE_ADMIN_EMAIL = 'sanoramyun8@gmail.com';
process.env.POCKETBASE_ADMIN_PASSWORD = 'T22qjsrlf67!';
process.env.NEXT_PUBLIC_POCKETBASE_URL = 'https://theyworkforcitizen-api.duckdns.org';

require('./2-import-to-pocketbase.js');
