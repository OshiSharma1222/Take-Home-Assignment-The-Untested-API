const taskService = require('../src/services/taskService');

describe('taskService', () => {
  beforeEach(() => {
    taskService._reset();
  });

  describe('create and retrieval', () => {
    test('creates a task with defaults', () => {
      const task = taskService.create({ title: 'Write tests' });

      expect(task).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          title: 'Write tests',
          description: '',
          status: 'todo',
          priority: 'medium',
          dueDate: null,
          completedAt: null,
          createdAt: expect.any(String),
        })
      );
    });

    test('findById returns the created task', () => {
      const created = taskService.create({ title: 'Find me' });
      const found = taskService.findById(created.id);

      expect(found).toEqual(created);
    });
  });

  describe('update and remove', () => {
    test('updates task fields', () => {
      const created = taskService.create({ title: 'Old', priority: 'low' });
      const updated = taskService.update(created.id, { title: 'New', priority: 'high' });

      expect(updated).toEqual(expect.objectContaining({ title: 'New', priority: 'high' }));
    });

    test('returns null when updating a non-existent task', () => {
      const updated = taskService.update('missing-id', { title: 'Nope' });
      expect(updated).toBeNull();
    });

    test('removes an existing task', () => {
      const created = taskService.create({ title: 'Delete me' });
      const deleted = taskService.remove(created.id);

      expect(deleted).toBe(true);
      expect(taskService.findById(created.id)).toBeUndefined();
    });

    test('returns false when removing a non-existent task', () => {
      expect(taskService.remove('missing-id')).toBe(false);
    });
  });

  describe('query and stats', () => {
    test('filters tasks by exact status', () => {
      taskService.create({ title: 'Todo task', status: 'todo' });
      taskService.create({ title: 'In progress task', status: 'in_progress' });

      const filtered = taskService.getByStatus('todo');

      expect(filtered).toHaveLength(1);
      expect(filtered[0].status).toBe('todo');
    });

    test('returns page 1 as the first page', () => {
      const first = taskService.create({ title: 'First' });
      const second = taskService.create({ title: 'Second' });
      taskService.create({ title: 'Third' });

      const pageOne = taskService.getPaginated(1, 2);

      expect(pageOne).toHaveLength(2);
      expect(pageOne.map((t) => t.id)).toEqual([first.id, second.id]);
    });

    test('returns counts by status and overdue count', () => {
      const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

      taskService.create({ title: 'Todo overdue', status: 'todo', dueDate: pastDate });
      taskService.create({ title: 'In progress', status: 'in_progress' });
      taskService.create({ title: 'Done task', status: 'done', dueDate: pastDate });

      const stats = taskService.getStats();

      expect(stats).toEqual({
        todo: 1,
        in_progress: 1,
        done: 1,
        overdue: 1,
      });
    });
  });

  describe('completeTask', () => {
    test('marks task as done and sets completedAt', () => {
      const created = taskService.create({ title: 'Complete me', priority: 'high' });
      const completed = taskService.completeTask(created.id);

      expect(completed).toEqual(
        expect.objectContaining({
          id: created.id,
          status: 'done',
          completedAt: expect.any(String),
        })
      );
    });

    test('returns null for non-existent task', () => {
      expect(taskService.completeTask('missing-id')).toBeNull();
    });
  });
});
