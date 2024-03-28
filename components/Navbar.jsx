// components/Navbar.jsx
import Link from 'next/link';
import Image from 'next/image';

const Navbar = () => {
  return (
    <nav className="bg-green-400 text-slate-900 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-lg font-bold flex items-center">
          <Image src="/images/aceking.jpg" alt="Logo" width={50} height={50} className="mr-2"/>
          <Link href="/">
            <a className="cursor-pointer">Blackjack Game</a>
          </Link>
        </div>
        <div className="flex gap-4">
          {/* Removed Login Link */}
          <Link href="/game">
            <a className="cursor-pointer hover:text-green-700 transition-colors">Game</a>
          </Link>
          <Link href="/scoreboard">
            <a className="cursor-pointer hover:text-green-700 transition-colors">Scoreboard</a>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
