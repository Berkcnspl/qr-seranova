import Script from "next/script";

const THEME_KEY = "seranova-theme";

export default function ThemeInitScript() {
  return (
    <Script
      id="theme-init"
      strategy="beforeInteractive"
      dangerouslySetInnerHTML={{
        __html: `(function(){var t=localStorage.getItem("${THEME_KEY}")||"dark";document.documentElement.setAttribute("data-theme",t);})();`,
      }}
    />
  );
}
