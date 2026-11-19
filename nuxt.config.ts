export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      googleOauthEnabled: false,
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:8000'
    },
  },
  compatibilityDate: '2026-11-10',
  devtools: {
    enabled: false
  },
  app: {
    head: {
      title: 'RAHANPAS SERVER MANAGER',
      meta: [
        {
          name: 'description',
          content: 'Centralized infrastructure and server management platform.'
        },
        {
          name: 'viewport',
          content: 'width=device-width, initial-scale=1'
        }
      ],
      script: [
        {
          src: 'https://cdn.tailwindcss.com',
          tagPosition: 'head'
        },
        {
          innerHTML: "try{var m=localStorage.getItem('rahanpas-theme')||'dark';var r=m==='system'?(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'):m;document.documentElement.dataset.theme=r;document.documentElement.style.colorScheme=r;}catch(e){}"
        }
      ]
    }
  }
})
