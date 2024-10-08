"use client";
import React, { useEffect, useState } from "react";
import PCard from "./PCard";
import { getCart } from "@/app/services/cartService";
import Loader from "@/app/components/Loader";

interface PlantsDetailsProps {
  plantId: string;
  count: number;
}

const PlantsDetails = () => {
  const [selectedPlants, setSelectedPlants] = useState<PlantsDetailsProps[]>(
    []
  );
  const [loading, setLoading] = useState(true); // State to track loading status

  const fetchCartData = async () => {
    try {
      console.log("Fetching cart data...");
      const cartData = await getCart();
      console.log("Cart data:", cartData);
      setSelectedPlants(cartData);
    } catch (error) {
      console.error("Failed to fetch cart data:", error);
    } finally {
      setLoading(false); // Set loading to false after data is fetched
    }
  };
  useEffect(() => {
    fetchCartData();
  }, []);

  return (
    <div className="w-full flex flex-col justify-start items-start gap-2 py-6 text-[#929292]">
      <h4 className="text-xl text-[#dcff50]">Plants selected</h4>
      {loading ? (
        <div className="w-full flex justify-center items-center">
          <Loader />
        </div>
      ) : (
        selectedPlants.map((item) => (
          <PCard
            key={item.plantId}
            id={item.plantId}
            count={item.count}
            onUpdate={() => fetchCartData()}
          />
        ))
      )}
    </div>
  );
};

export default PlantsDetails;
