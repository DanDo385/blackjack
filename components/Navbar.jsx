// components/Navbar.jsx
import Link from 'next/link';

const Navbar = () => {
  return (
    <nav className="bg-green-400 text-slate-900 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-lg font-bold">
          <Link href="/" className="cursor-pointer">
            <span>Blackjack Game</span>
          </Link>
        </div>
        <div className="flex gap-4">
          <Link href="/login" className="cursor-pointer hover:text-green-400 transition-colors">
            <span>Login</span>
          </Link>
          <Link href="/game" className="cursor-pointer hover:text-green-400 transition-colors">
            <span>Game</span>
          </Link>
          <Link href="/scoreboard" className="cursor-pointer hover:text-green-400 transition-colors">
            <span>Scoreboard</span>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
