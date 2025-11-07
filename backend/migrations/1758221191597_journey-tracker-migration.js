export const up = (pgm) => {
    pgm.createTable('users', {
        id: 'id',
        name: { type: 'varchar(1000)', notNull: true },
        createdAt: {
            type: 'timestamp',
            notNull: true,
            default: pgm.func('current_timestamp'),
        },
    });
    pgm.createTable('journeys', {
        id: 'id',
        userId: {
            type: 'integer',
            notNull: true,
            references: '"users"',
            onDelete: 'CASCADE',
        },
        body: { type: 'text', notNull: true },
        createdAt: {
            type: 'timestamp',
            notNull: true,
            default: pgm.func('current_timestamp'),
        },
    });
    pgm.createIndex('journeys', 'userId');
};