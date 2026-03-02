import { initDatabase } from './db/database';
import app from './app';

const port = process.env.PORT || 3000;

initDatabase()
    .then(() => {
        app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });
    })
    .catch((err) => {
        console.error('Failed to initialize database:', err);
        process.exit(1);
    });
