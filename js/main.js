// Set darkmode
document.getElementById('mode').addEventListener('click', () => {
    document.body.classList.toggle('dark');
    localStorage.setItem('theme', document.body.classList.contains('dark') ? 'dark' : 'light');
});
  
// enforce local storage setting but also fallback to user-agent preferences
if (localStorage.getItem('theme') === 'dark' || (!localStorage.getItem('theme') && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
    document.body.classList.add('dark');
}

// Copy the docs section links into the hamburger menu on mobile
const docsLinks = document.querySelector('.docs-sidebar .docs-links');
const navbarCollapse = document.querySelector('.navbar-collapse');
if (docsLinks && navbarCollapse) {
    const mobileNav = docsLinks.cloneNode(true);
    mobileNav.classList.add('mobile-docs-nav', 'd-md-none');
    mobileNav.setAttribute('aria-label', 'Section navigation');
    navbarCollapse.appendChild(mobileNav);
}
