import { useState } from 'react';
import { Minus, Plus, X } from 'lucide-react';

const MenuCard = ({ id, name, cn, desc, price, stocks, image, jumlah, tambah, kurang }) => {
  const [openPopUp, setOpenPopUp] = useState(false);

  return (
    <div className="relative bg-white rounded-xl shadow-lg p-4">
      <div className="lg:flex">
        <img
          onClick={() => setOpenPopUp(true)}
          src={image}
          alt={name}
          className="h-32 lg:h-64 object-cover rounded-md"
        />

        {/* nama menu + price */}
        <div className="text-left">
          <h3 className="text-black text-sm font-medium">{name}</h3>
          <h3 className="text-black text-sm font-medium">{cn}</h3>
          <p className="text-agro-color text-sm font-semibold">
            {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price)}
          </p>
        </div>
      </div>

      <div className='text-left'>
        <h3 className='text-sm font-medium'>
          {stocks < 1 ? <div>Stocks: <span className='text-red-500'>Empty</span></div> : <div>Stocks: <span className='text-agro-color'>{stocks}</span></div>}
        </h3>
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

        <button className={`rounded-full p-1 ${stocks < 1 || !stocks ? 'bg-gray-200 text-gray-400' : 'button-normal button-hover disable'
          }`} onClick={() => tambah(id)} disabled={stocks < 1}>
          <Plus size={16} />
        </button>
      </div>

      {openPopUp && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="relative bg-white rounded-2xl shadow-xl p-6 w-96 max-w-3/4">

            <button
              onClick={() => setOpenPopUp(false)}
              className="absolute top-3 right-3 text-gray-600 hover:text-black"
            >
              <X size={24} />
            </button>

            <img
              src={image}
              alt={name}
              className="w-full h-48 object-cover rounded-lg"
            />

            <h2 className="mt-4 text-xl font-bold">{name}</h2>
            <h2 className="text-xl font-bold">{cn}</h2>
            <p className="text-gray-500 mb-2">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price)}</p>
            <p className="overflow-y-auto pr-2 text-gray-700">{desc}</p>
          </div>
        </div>
      )}

    </div>
  );
};

export default MenuCard;