# Learnings

## Transactions: isolation level and rollback errors

### Notes

- Look more into transaction isolation levels.
- Look more into rollback error handling.

### Isolation level idea (draft)

```ts
type IsolationLevel = "READ COMMITTED" | "REPEATABLE READ" | "SERIALIZABLE";

export async function runTransaction<T, Args extends unknown[]>(
  db: Pool,
  func: (db: PoolConnection | Pool, ...props: Args) => Promise<T>,
  props: Args,
  isolationLevel: IsolationLevel = "REPEATABLE READ",
): Promise<T> {
  const connection = await db.getConnection();
  try {
    await connection.execute(
      `SET SESSION TRANSACTION ISOLATION LEVEL ${isolationLevel}`,
    );
    await connection.beginTransaction();
    const result = await func(connection, ...props);
    await connection.commit();
    return result;
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    await connection.execute(
      "SET SESSION TRANSACTION ISOLATION LEVEL REPEATABLE READ",
    );
    connection.release();
  }
}
```

### Caution

The rollback path should not hide the original error.
If `rollback()` throws, the original failure can be lost, which makes production debugging harder.
