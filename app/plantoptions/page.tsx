"use client";

import React, { useState, useEffect } from "react";
import { JetBrains_Mono } from "next/font/google";
import Navbar from "@/app/components/Navbar";
import Plants from "../constants";
import PlantCard from "./components/PlantCard";
import { useSearchParams, useRouter } from "next/navigation";

const jetBrainsMono = JetBrains_Mono({
  weight: ["200", "300", "400", "500", "600", "700", "800"],
  subsets: ["latin"],
});

const PlantOptions = () => {
  const searchParams = useSearchParams();
  const limit = searchParams.get("limit");
  const router = useRouter();
  const [selectedPlants, setSelectedPlants] = useState<string[]>([]);
  const selectionLimit = limit === "multiple" ? Infinity : Number(limit);

  useEffect(() => {
    if (!limit) {
      router.push("/subscription");
    }
  }, [limit, router]);

  const toggleSelection = (id: string) => {
    console.log(selectedPlants);
    setSelectedPlants((prevSelectedPlants) =>
      prevSelectedPlants.includes(id)
        ? prevSelectedPlants.filter((plantId) => plantId !== id)
        : prevSelectedPlants.length < selectionLimit
        ? [...prevSelectedPlants, id]
        : prevSelectedPlants
    );
  };

  return (
    <div
      className={`w-full h-full min-h-[100vh] bg-[#212121] text-[#fdfdfd] flex flex-col justify-center items-center ${jetBrainsMono.className} pb-10`}
    >
      <Navbar />
      <p className="text-lg font-thin">
        Choose from the wide variety of plants, specially selected for special
        occasions
      </p>
      <div className="plant-list">
        {Object.keys(Plants).map((occasion) => (
          <div
            className="w-full max-w-[960px] flex flex-col justify-start items-start py-10 gap-8 text-[#dcff50]"
            key={occasion}
          >
            <h2 className="text-4xl">{occasion}</h2>
            <div className="w-full flex justify-center items-center gap-6">
              {Plants[occasion as keyof typeof Plants].map((plant) => (
                <div
                  key={plant.id}
                  className={`plant-card ${
                    selectedPlants.includes(plant.id)
                      ? "bg-[#dcff50] text-[#212121]"
                      : ""
                  }`}
                >
                  <PlantCard
                    key={plant.id}
                    id={plant.id}
                    imag={plant.plantImage}
                    name={plant.plantName}
                    onSelect={() => toggleSelection(plant.id)}
                    isSelected={selectedPlants.includes(plant.id)}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlantOptions;
