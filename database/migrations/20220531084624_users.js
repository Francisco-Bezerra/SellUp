
exports.up = function(knex) {
    return knex.schema.createTable('users', function (table) {
        table.increments('id').primary();//primary key
        table.string('name').notNullable();//não nulo
        table.string('email').notNullable();
        table.string('whatsapp').notNullable();
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('users');
};
// npx knex init
// npx knex migrate:make users
// npx knex migrate:latest
// npx knex migrate:rollback