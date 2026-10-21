import { Injectable, NotFoundException, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Pool } from 'pg';

@Injectable()
export class TodosService implements OnModuleInit, OnModuleDestroy {
  private readonly pool = new Pool({ connectionString: process.env.DATABASE_URL });

  async onModuleInit() {
    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS todos (
        id SERIAL PRIMARY KEY,
        title VARCHAR(200) NOT NULL CHECK (length(trim(title)) > 0),
        completed BOOLEAN NOT NULL DEFAULT FALSE
      )
    `);
  }

  async onModuleDestroy() {
    await this.pool.end();
  }

  async list() {
    return (await this.pool.query('SELECT * FROM todos ORDER BY id DESC')).rows;
  }

  async create(title: string) {
    return (await this.pool.query('INSERT INTO todos (title) VALUES ($1) RETURNING *', [title])).rows[0];
  }

  async update(id: number, completed: boolean) {
    const result = await this.pool.query('UPDATE todos SET completed = $1 WHERE id = $2 RETURNING *', [completed, id]);
    if (!result.rowCount) throw new NotFoundException('할 일을 찾을 수 없습니다.');
    return result.rows[0];
  }

  async rename(id: number, title: string) {
    const result = await this.pool.query('UPDATE todos SET title = $1 WHERE id = $2 RETURNING *', [title, id]);
    if (!result.rowCount) throw new NotFoundException('할 일을 찾을 수 없습니다.');
    return result.rows[0];
  }

  async remove(id: number) {
    const result = await this.pool.query('DELETE FROM todos WHERE id = $1 RETURNING id', [id]);
    if (!result.rowCount) throw new NotFoundException('할 일을 찾을 수 없습니다.');
    return result.rows[0];
  }
}
