export const up = (pgm) => {
    pgm.addColumns('users', {
        password: { type: 'text', notNull: true }
    });
};