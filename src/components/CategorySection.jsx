import React from "react";

const CategorySection = ({ title, products }) => {
  return (
    <div className="mb-8">
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <div className="flex overflow-x-auto space-x-4">
        {products.map((item) => (
          <div
            key={item.id}
            className="min-w-[150px] bg-white p-2 rounded shadow"
          >
            <img
              src={item.imageUrl}
              alt={item.name}
              className="h-28 w-full object-cover rounded"
            />
            <h4 className="mt-2 font-medium text-sm">{item.name}</h4>
            <p className="text-xs text-gray-500">{item.description}</p>
            <p className="text-sm font-bold text-green-600">₦{item.price}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategorySection;
