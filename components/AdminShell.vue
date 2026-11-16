<script setup lang="ts">
const props = defineProps<{
  title: string
  breadcrumb: string
  activeMenu: 'overview' | 'servers' | 'users' | 'server-ips' | 'groups' | 'roles' | 'permissions' | 'settings'
  user: any
}>()

const mobileMenuOpen = ref(false)
const loggingOut = ref(false)

function hasPerm(slug: string): boolean {
  if (props.user?.is_super_admin) return true
  const perms = props.user?.permissions
  if (!Array.isArray(perms)) return false
  return perms.includes(slug)
}

const canViewServers = computed(() => hasPerm('server.view'))
const canUsers = computed(() => hasPerm('users.view') || hasPerm('users.manage'))
const canGroups = computed(() => hasPerm('groups.manage'))
const canRoles = computed(() => hasPerm('roles.manage'))
const canPermissions = computed(() => hasPerm('permissions.manage'))
const hasAdminSection = computed(() => canUsers.value || canGroups.value || canRoles.value || canPermissions.value)

async function logout() {
  loggingOut.value = true
  try {
    await $fetch('/auth/logout', { method: 'POST' })
  } finally {
    await navigateTo('/')
  }
}
</script>

<template>
  <main class="shell">
    <div v-if="mobileMenuOpen" class="shell-backdrop" @click="mobileMenuOpen = false" />

    <aside class="shell-sidebar" :class="{ open: mobileMenuOpen }">
      <div class="shell-brand">
        <div class="shell-logo">R</div>
        <div>
          <strong>RAHANPAS</strong>
          <small>SERVER MANAGER</small>
        </div>
        <button class="shell-close" type="button" aria-label="Close menu" @click="mobileMenuOpen = false">✕</button>
      </div>

      <div class="shell-nav-label">MAIN MENU</div>
      <NuxtLink to="/dashboard" class="shell-nav-item" :class="{ active: activeMenu === 'overview' }" @click="mobileMenuOpen = false">
        <span>▦</span> Overview
      </NuxtLink>
      <NuxtLink v-if="canViewServers" to="/servers" class="shell-nav-item" :class="{ active: activeMenu === 'servers' }" @click="mobileMenuOpen = false">
        <span>▣</span> Servers
      </NuxtLink>

      <template v-if="hasAdminSection">
        <div class="shell-nav-label">ADMINISTRATION</div>
        <NuxtLink v-if="canUsers" to="/admin/users" class="shell-nav-item" :class="{ active: activeMenu === 'users' }" @click="mobileMenuOpen = false">
          <span>◎</span> User Management
        </NuxtLink>
        <NuxtLink v-if="hasPerm('users.manage')" to="/admin/server-ips" class="shell-nav-item" :class="{ active: activeMenu === 'server-ips' }" @click="mobileMenuOpen = false">
          <span>⛨</span> Server IP Access
        </NuxtLink>
        <NuxtLink v-if="canGroups" to="/admin/groups" class="shell-nav-item" :class="{ active: activeMenu === 'groups' }" @click="mobileMenuOpen = false">
          <span>◈</span> Group Management
        </NuxtLink>
        <NuxtLink v-if="canRoles" to="/admin/roles" class="shell-nav-item" :class="{ active: activeMenu === 'roles' }" @click="mobileMenuOpen = false">
          <span>◆</span> Role Management
        </NuxtLink>
        <NuxtLink v-if="canPermissions" to="/admin/permissions" class="shell-nav-item" :class="{ active: activeMenu === 'permissions' }" @click="mobileMenuOpen = false">
          <span>⌘</span> Permission Management
        </NuxtLink>
      </template>

      <div class="shell-nav-label">ACCOUNT</div>
      <NuxtLink to="/account/settings" class="shell-nav-item" :class="{ active: activeMenu === 'settings' }" @click="mobileMenuOpen = false">
        <span>⚙</span> User Settings
      </NuxtLink>
      <button type="button" class="shell-nav-item shell-nav-btn" :disabled="loggingOut" @click="logout">
        <span>↪</span> {{ loggingOut ? 'Signing out...' : 'Sign Out' }}
      </button>

      <div class="shell-sidebar-bottom">
        <div class="shell-connection"><span></span> Application online</div>
        <small>RAHANPAS SERVER MANAGER<br />RBAC Enabled</small>
      </div>
    </aside>

    <section class="shell-main">
      <header class="shell-topbar">
        <div class="shell-topbar-left">
          <button class="shell-menu-toggle" type="button" aria-label="Open menu" @click="mobileMenuOpen = true">☰</button>
          <div>
            <div class="shell-breadcrumb">{{ breadcrumb }}</div>
            <h1>{{ title }}</h1>
          </div>
        </div>

        <div class="shell-user-area">
          <div class="shell-avatar">{{ user?.name?.charAt(0)?.toUpperCase() || 'U' }}</div>
          <div class="shell-user-info">
            <strong>{{ user?.name || 'Loading...' }}</strong>
            <small>{{ user?.email || '' }}</small>
          </div>
        </div>
      </header>

      <div class="shell-content">
        <slot />
      </div>
    </section>
  </main>
</template>

<style scoped>
.shell {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 255px minmax(0, 1fr);
  background: var(--app-bg);
  color: var(--text);
}
.shell-sidebar {
  min-height: 100vh;
  padding: 22px 16px;
  display: flex;
  flex-direction: column;
  border-right: 1px solid var(--border-subtle);
  background: var(--surface);
}
.shell-brand {
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 0 8px 24px;
}
.shell-logo, .shell-avatar {
  width: 38px;
  height: 38px;
  flex-shrink: 0;
  display: grid;
  place-items: center;
  border-radius: 10px;
  background: linear-gradient(135deg, #2563eb, #0891b2);
  color: #ffffff;
  font-size: 18px;
  font-weight: 800;
}
.shell-brand strong { display: block; font-size: 12px; letter-spacing: .12em; color: var(--text-bright); }
.shell-brand small { display: block; margin-top: 3px; color: var(--text-muted); font-size: 9px; letter-spacing: .12em; }
.shell-nav-label {
  padding: 14px 10px 8px;
  color: var(--text-muted);
  font-size: 9px;
  font-weight: 800;
  letter-spacing: .14em;
}
.shell-nav-item {
  min-height: 40px;
  margin: 2px 0;
  padding: 0 12px;
  display: flex;
  align-items: center;
  gap: 10px;
  border-radius: 8px;
  color: var(--text-secondary);
  font-size: 12px;
  font-weight: 500;
  text-decoration: none;
  border: 0;
  background: transparent;
  width: 100%;
  text-align: left;
  cursor: pointer;
}
.shell-nav-item:hover {
  background: var(--surface-hover);
  color: var(--text-bright);
}
.shell-nav-item.active {
  background: rgba(37, 99, 235, 0.15);
  color: var(--primary-soft-text);
  font-weight: 600;
}
.shell-nav-item > span { width: 16px; text-align: center; font-size: 14px; }
.shell-nav-btn:hover { color: var(--danger-text); }
.shell-sidebar-bottom {
  margin-top: auto;
  padding: 16px 8px 4px;
  border-top: 1px solid var(--border-subtle);
}
.shell-connection { margin-bottom: 10px; color: var(--success-text); font-size: 11px; }
.shell-connection span {
  width: 7px; height: 7px; display: inline-block; margin-right: 6px;
  border-radius: 50%; background: #22c55e;
}
.shell-sidebar-bottom > small { color: var(--text-muted); font-size: 10px; line-height: 1.6; }
.shell-main { min-width: 0; padding: 0 32px 80px; }
.shell-topbar {
  min-height: 82px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  border-bottom: 1px solid var(--border-subtle);
}
.shell-topbar-left { display: flex; align-items: center; gap: 12px; min-width: 0; }
.shell-breadcrumb { margin-bottom: 4px; color: var(--text-muted); font-size: 11px; }
.shell-topbar h1 { margin: 0; font-size: 20px; color: var(--text-bright); }
.shell-user-area { display: flex; align-items: center; gap: 10px; }
.shell-user-info strong, .shell-user-info small { display: block; }
.shell-user-info strong { font-size: 12px; color: var(--text-bright); }
.shell-user-info small { font-size: 10px; color: var(--text-muted); }
.shell-content { padding-top: 24px; }
.shell-menu-toggle, .shell-close {
  display: none; align-items: center; justify-content: center;
  width: 36px; height: 36px; border: 1px solid var(--border-strong);
  border-radius: 8px; background: transparent; color: var(--text); font-size: 16px; cursor: pointer;
}
.shell-close { margin-left: auto; width: 32px; height: 32px; font-size: 14px; }
.shell-backdrop { display: none; }

@media (max-width: 960px) {
  .shell { grid-template-columns: 1fr; }
  .shell-menu-toggle, .shell-close { display: inline-flex; }
  .shell-backdrop {
    display: block; position: fixed; inset: 0; z-index: 999;
    background: rgba(2, 6, 23, 0.6); backdrop-filter: blur(2px);
  }
  .shell-sidebar {
    position: fixed; inset: 0 auto 0 0; z-index: 1000;
    width: 265px; max-width: 82vw; min-height: 100vh;
    transform: translateX(-100%); transition: transform 0.22s ease; overflow-y: auto;
  }
  .shell-sidebar.open { transform: translateX(0); }
  .shell-main { padding: 0 18px 80px; }
}
@media (max-width: 640px) {
  .shell-main { padding: 0 14px 80px; }
  .shell-user-info { display: none; }
}
</style>
