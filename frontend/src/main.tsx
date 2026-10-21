import { useEffect, useState, type FormEvent } from 'react';
import { createRoot } from 'react-dom/client';

type Todo = { id: number; title: string; completed: boolean };

async function request<T>(path = '', options?: RequestInit): Promise<T> {
  const response = await fetch(`/api/todos${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json' },
  });
  if (!response.ok) throw new Error('요청을 처리하지 못했습니다. 다시 시도해 주세요.');
  return response.json();
}

function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [pendingIds, setPendingIds] = useState<number[]>([]);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState('');

  async function load() {
    setLoading(true);
    setError('');
    try {
      setTodos(await request<Todo[]>());
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  async function mutate(action: () => Promise<void>, id?: number) {
    if (id === undefined) setAdding(true);
    else setPendingIds((current) => [...current, id]);
    setError('');
    try {
      await action();
    } catch (error) {
      setError((error as Error).message);
    } finally {
      if (id === undefined) setAdding(false);
      else setPendingIds((current) => current.filter((pendingId) => pendingId !== id));
    }
  }

  function add(event: FormEvent) {
    event.preventDefault();
    if (!title.trim() || adding) return;
    void mutate(async () => {
      const todo = await request<Todo>('', { method: 'POST', body: JSON.stringify({ title: title.trim() }) });
      setTodos((current) => [todo, ...current]);
      setTitle('');
    });
  }

  return (
    <main>
      <h1>투두리스트</h1>
      <form onSubmit={add}>
        <label htmlFor="title">할 일 </label>
        <input id="title" value={title} onChange={(event) => setTitle(event.target.value)} maxLength={200} required disabled={adding || loading} />
        <button disabled={adding || loading || !title.trim()}>추가</button>
      </form>
      {error && <p role="alert">{error} <button onClick={() => void load()} disabled={loading || adding || pendingIds.length > 0}>다시 불러오기</button></p>}
      {loading ? <p>불러오는 중...</p> : todos.length === 0 && !error ? <p>할 일이 없습니다.</p> : (
        <ul>
          {todos.map((todo) => (
            <li key={todo.id}>
              {editingId === todo.id ? (
                <form onSubmit={(event) => {
                  event.preventDefault();
                  if (!editTitle.trim() || pendingIds.includes(todo.id)) return;
                  void mutate(async () => {
                    const updated = await request<Todo>(`/${todo.id}/title`, { method: 'PATCH', body: JSON.stringify({ title: editTitle.trim() }) });
                    setTodos((current) => current.map((item) => item.id === todo.id ? updated : item));
                    setEditingId((current) => current === todo.id ? null : current);
                  }, todo.id);
                }}>
                  <input aria-label="할 일 수정" autoFocus value={editTitle} onChange={(event) => setEditTitle(event.target.value)} maxLength={200} required disabled={pendingIds.includes(todo.id) || loading} />
                  <button disabled={pendingIds.includes(todo.id) || loading || !editTitle.trim()}>저장</button>
                  <button type="button" disabled={pendingIds.includes(todo.id) || loading} onClick={() => setEditingId(null)}>취소</button>
                </form>
              ) : <>
              <label>
                <input type="checkbox" checked={todo.completed} disabled={pendingIds.includes(todo.id) || loading} onChange={() => void mutate(async () => {
                  const updated = await request<Todo>(`/${todo.id}`, { method: 'PATCH', body: JSON.stringify({ completed: !todo.completed }) });
                  setTodos((current) => current.map((item) => item.id === todo.id ? updated : item));
                }, todo.id)} />
                {todo.completed ? <s>{todo.title}</s> : todo.title}
              </label>{' '}
              <button disabled={pendingIds.includes(todo.id) || loading} onClick={() => {
                setEditingId(todo.id);
                setEditTitle(todo.title);
              }}>수정</button>{' '}
              <button disabled={pendingIds.includes(todo.id) || loading} aria-label={`${todo.title} 삭제`} onClick={() => void mutate(async () => {
                await request(`/${todo.id}`, { method: 'DELETE' });
                setTodos((current) => current.filter((item) => item.id !== todo.id));
              }, todo.id)}>삭제</button>
              </>}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

createRoot(document.getElementById('root')!).render(<App />);
