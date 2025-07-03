import { FiBook, FiHelpCircle, FiClock } from 'react-icons/fi';

const Header = () => {
  return (
    <header className="bg-white shadow">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <FiBook className="text-primary text-2xl mr-2" />
            <h1 className="text-xl font-bold text-gray-800">BookTranslator</h1>
          </div>
          <nav>
            <ul className="flex space-x-6">
              <li className="flex items-center text-gray-600 hover:text-primary transition-colors">
                <span className="hidden md:inline">English</span>
              </li>
              <li className="flex items-center text-gray-600 hover:text-primary transition-colors">
                <FiHelpCircle className="mr-1" />
                <span className="hidden md:inline">Help Center</span>
              </li>
              <li className="flex items-center text-gray-600 hover:text-primary transition-colors">
                <FiClock className="mr-1" />
                <span className="hidden md:inline">History</span>
              </li>
              <li>
                <button className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-md transition-colors">
                  Translate Now
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;