import { NavLink, Outlet } from 'react-router-dom';

export function AdminLayout() {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
      <aside className="surface h-fit p-4">
        <p className="mb-3 text-sm font-semibold text-muted-foreground">Admin</p>
        <nav className="flex gap-2 lg:flex-col">
          <NavLink
            to="/admin"
            end
            className={({ isActive }) =>
              `rounded-lg px-3 py-2 text-sm ${isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`
            }
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/admin/posts"
            className={({ isActive }) =>
              `rounded-lg px-3 py-2 text-sm ${isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`
            }
          >
            Requests
          </NavLink>
        </nav>
      </aside>
      <section className="min-w-0">
        <Outlet />
      </section>
    </div>
  );
}
