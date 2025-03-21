export default function Header() {
  return (
    <header className="mb-8">
      <div className="flex flex-col md:flex-row justify-between items-center">
        <div className="flex items-center mb-4 md:mb-0">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3.1 11.2a.5.5 0 0 1 .4-.2H6a.5.5 0 0 1 0 1H3.75L1.5 15h17l-2.25-3H13a.5.5 0 0 1 0-1h3.5a.5.5 0 0 1 .4.2l3 4a.5.5 0 0 1-.4.8H.5a.5.5 0 0 1-.4-.8l3-4z" clipRule="evenodd"/>
            <path d="M4 4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2h1a1 1 0 0 1 0 2H3a1 1 0 1 1 0-2h1V4z"/>
          </svg>
          <h1 className="text-2xl md:text-3xl font-bold text-neutral-800">Kitchen Companion</h1>
        </div>
        <div>
          <p className="text-sm text-neutral-500 italic">Powered by OpenAI GPT-4.0</p>
        </div>
      </div>
    </header>
  );
}
