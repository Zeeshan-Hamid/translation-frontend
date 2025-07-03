const Footer = () => {
  return (
    <footer className="bg-secondary py-4">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <p className="text-gray-600 text-sm">
            &copy; {new Date().getFullYear()} BookTranslator - Internal Company Tool
          </p>
          <div className="mt-2 md:mt-0">
            <span className="text-gray-500 text-sm">
              Processing powered by OpenRouter.ai
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;