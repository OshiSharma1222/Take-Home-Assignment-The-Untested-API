const request = require('supertest');
const app = require('../src/app');
const taskService = require('../src/services/taskService');

describe('tasks routes', () => {
  beforeEach(() => {
    taskService._reset();
  });

  describe('GET /tasks', () => {
    test('returns all tasks', async () => {
      taskService.create({ title: 'A' });
      taskService.create({ title: 'B' });

      const res = await request(app).get('/tasks');

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(2);
    });

    test('filters by status', async () => {
      taskService.create({ title: 'Todo', status: 'todo' });
      taskService.create({ title: 'Done', status: 'done' });

      const res = await request(app).get('/tasks').query({ status: 'done' });

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].status).toBe('done');
    });

    test('supports pagination', async () => {
      taskService.create({ title: 'A' });
      taskService.create({ title: 'B' });
      taskService.create({ title: 'C' });

      const res = await request(app).get('/tasks').query({ page: 1, limit: 2 });

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(2);
      expect(res.body[0].title).toBe('A');
      expect(res.body[1].title).toBe('B');
    });
  });

  describe('POST /tasks', () => {
    test('creates a task', async () => {
      const res = await request(app).post('/tasks').send({ title: 'New task', priority: 'high' });

      expect(res.status).toBe(201);
      expect(res.body).toEqual(
        expect.objectContaining({
          title: 'New task',
          priority: 'high',
        })
      );
    });

    test('returns 400 for invalid payload', async () => {
      const res = await request(app).post('/tasks').send({ title: '' });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/title is required/);
    });
  });

  describe('PUT /tasks/:id', () => {
    test('updates an existing task', async () => {
      const created = taskService.create({ title: 'Before' });

      const res = await request(app).put(`/tasks/${created.id}`).send({ title: 'After', status: 'in_progress' });

      expect(res.status).toBe(200);
      expect(res.body.title).toBe('After');
      expect(res.body.status).toBe('in_progress');
    });

    test('returns 404 for non-existent task', async () => {
      const res = await request(app).put('/tasks/missing-id').send({ title: 'After' });

      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Task not found');
    });
  });

  describe('DELETE /tasks/:id', () => {
    test('deletes an existing task', async () => {
      const created = taskService.create({ title: 'Delete me' });

      const res = await request(app).delete(`/tasks/${created.id}`);

      expect(res.status).toBe(204);
    });

    test('returns 404 for non-existent task', async () => {
      const res = await request(app).delete('/tasks/missing-id');

      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Task not found');
    });
  });

  describe('PATCH /tasks/:id/complete', () => {
    test('marks a task as complete', async () => {
      const created = taskService.create({ title: 'Complete me' });

      const res = await request(app).patch(`/tasks/${created.id}/complete`);

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('done');
      expect(res.body.completedAt).toEqual(expect.any(String));
    });

    test('returns 404 for non-existent task', async () => {
      const res = await request(app).patch('/tasks/missing-id/complete');

      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Task not found');
    });
  });

  describe('PATCH /tasks/:id/assign', () => {
    test('assigns a task to a user', async () => {
      const created = taskService.create({ title: 'Assign me' });

      const res = await request(app).patch(`/tasks/${created.id}/assign`).send({ assignee: 'Oshi' });

      expect(res.status).toBe(200);
      expect(res.body.assignee).toBe('Oshi');
      expect(res.body.id).toBe(created.id);
    });

    test('returns 404 for non-existent task', async () => {
      const res = await request(app).patch('/tasks/missing-id/assign').send({ assignee: 'Oshi' });

      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Task not found');
    });

    test('returns 400 when assignee is empty', async () => {
      const created = taskService.create({ title: 'Assign me' });

      const res = await request(app).patch(`/tasks/${created.id}/assign`).send({ assignee: '   ' });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('assignee must be a non-empty string');
    });

    test('returns 409 when task is already assigned', async () => {
      const created = taskService.create({ title: 'Already assigned' });
      await request(app).patch(`/tasks/${created.id}/assign`).send({ assignee: 'Aman' });

      const res = await request(app).patch(`/tasks/${created.id}/assign`).send({ assignee: 'Sam' });

      expect(res.status).toBe(409);
      expect(res.body.error).toBe('Task is already assigned');
    });
  });

  describe('GET /tasks/stats', () => {
    test('returns counts by status and overdue', async () => {
      const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      taskService.create({ title: 'Todo overdue', status: 'todo', dueDate: pastDate });
      taskService.create({ title: 'Done task', status: 'done', dueDate: pastDate });

      const res = await request(app).get('/tasks/stats');

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        todo: 1,
        in_progress: 0,
        done: 1,
        overdue: 1,
      });
    });
  });
});
