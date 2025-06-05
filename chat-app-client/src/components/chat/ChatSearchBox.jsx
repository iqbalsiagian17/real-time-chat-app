export default function ChatSearchBox({ search, setSearch }) {
  return (
    <div style={{ padding: '0.5rem' }}>
      <input
        type="text"
        placeholder="Search..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ width: '100%', padding: '0.5rem', borderRadius: '4px' }}
      />
    </div>
  );
}
