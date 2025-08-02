import { Minus, Plus } from 'lucide-react';

const MenuCard = ({ id, name, price, image, jumlah, tambah, kurang}) => {
  return (
    <div className="relative bg-white rounded-xl shadow-lg p-4">
      <div className="lg:flex">
        <img
          src={image}
          alt={name}
          className="h-32 lg:h-64 object-cover rounded-md"
        />

        {/* nama menu + price */}
        <div className="mt-4 text-left">
          <h3 className="text-black text-sm font-medium">{name}</h3>
          <p className="text-red-500 text-sm font-semibold">Rp{price.toFixed(3)}</p>
        </div>
      </div>

      <br />

      {/* Button */}
      <div className="absolute bottom-2 right-2 flex items-center space-x-2">

        {jumlah > 0 && (
          <button className="button-normal button-hover" onClick={() => kurang(id)}>
            <Minus size={16} />
          </button>
        )}

        {jumlah > 0 && (
          <span className="text-black font-semibold w-6">{jumlah}</span>
        )}

        <button className={`rounded-full p-1 ${jumlah > 9 ? 'bg-gray-200 text-gray-400' : 'button-normal button-hover'
          }`} onClick={() => tambah(id)}>
          <Plus size={16} />
        </button>
      </div>
    </div>
  );
};

export default MenuCard;