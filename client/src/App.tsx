import { useEffect, useState } from "react";
import "./App.css";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

import { Button } from "@/components/ui/button";

import { FcAbout } from "react-icons/fc";

interface Facility {
  code: string;
  name: string;
  network_id: string;
  network_region: string;
  description: string;
  units: FacilityUnit[];
}
interface FacilityUnit {
  code: string;
  fueltech_id: string;
  status_id: string;
  emissions_factor_co2: number;
  data_first_seen: string;
  data_last_seen: string;
  dispatch_type: string;
  capacity_registered: number;
}

interface FueltechFilter {
  battery_charging: boolean;
  battery_discharging: boolean;
  bioenergy_biogas: boolean;
  bioenergy_biomass: boolean;
  coal_black: boolean;
  coal_brown: boolean;
  distillate: boolean;
  gas_ccgt: boolean;
  gas_ocgt: boolean;
  gas_recip: boolean;
  gas_steam: boolean;
  gas_wcmg: boolean;
  hydro: boolean;
  pumps: boolean;
  solar_rooftop: boolean;
  solar_thermal: boolean;
  solar_utility: boolean;
  nuclear: boolean;
  wind: boolean;
  wind_offshore: boolean;
  interconnector: boolean;
}

interface StatusFilter {
  committed: boolean;
  operating: boolean;
  retired: boolean;
}

const DEFAULT_FUELTECH_FILTER: FueltechFilter = {
  battery_charging: false,
  battery_discharging: false,
  bioenergy_biogas: false,
  bioenergy_biomass: false,
  coal_black: false,
  coal_brown: false,
  distillate: false,
  gas_ccgt: false,
  gas_ocgt: false,
  gas_recip: false,
  gas_steam: false,
  gas_wcmg: false,
  hydro: false,
  pumps: false,
  solar_rooftop: false,
  solar_thermal: false,
  solar_utility: false,
  nuclear: false,
  wind: false,
  wind_offshore: false,
  interconnector: false,
};

const DEFAULT_STATUS_FILTER: StatusFilter = {
  committed: false,
  operating: false,
  retired: false,
};

const PAGE_SIZE = 10; // Number of items per page

function App() {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [page, setPage] = useState(0);
  const [fueltechFilter, setFueltechFilter] = useState<FueltechFilter>(
    DEFAULT_FUELTECH_FILTER
  );
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(
    DEFAULT_STATUS_FILTER
  );

  useEffect(() => {
    let abort = false;

    fetch("/api/facilities").then(async (res) => {
      if (res.ok) {
        const body = await res.json();
        if (abort) {
          return;
        }
        setFacilities(body);
      }
    });

    return () => {
      abort = true;
    };
  }, []);

  // I let copilot write this for me
  const paginate = (direction: number) => {
    const filteredFacilities = filterFacilities(facilities);
    setPage((prevPage) => {
      const newPage = prevPage + direction;
      if (newPage < 0 || newPage * PAGE_SIZE >= filteredFacilities.length) {
        return prevPage; // Prevent going out of bounds
      }
      return newPage;
    });
  };

  // copilot wrote this too... I was impressed until it didnt work and I had to fix it
  const filterFacilities = (facilities: Facility[]) => {
    return facilities.filter((facility) => {
      // Apply fueltech filter
      const fueltechMatch =
        Object.entries(fueltechFilter).every(([, v]) => v === false) ||
        Object.entries(fueltechFilter).some(([key, value]) => {
          if (value) {
            // If the filter is enabled, check if the facility's units match the fueltech type
            return facility.units.some((unit) => unit.fueltech_id === key);
          }
          return false; // If the filter is not enabled, include all facilities
        });
      // Apply status filter
      const statusMatch =
        Object.entries(statusFilter).every(([, v]) => v === false) ||
        Object.entries(statusFilter).some(([key, value]) => {
          if (value) {
            // If the filter is enabled, check if the facility's units match the status
            return facility.units.some((unit) => unit.status_id === key);
          }
          return false; // If the filter is not enabled, include all facilities
        });

      return fueltechMatch && statusMatch;
    });
  };

  const checkFueltechFilter = (fueltech: string, checked: boolean) => {
    let fueltechs: string[] = [];

    switch (fueltech.toLowerCase()) {
      case "coal":
        fueltechs = ["coal_black", "coal_brown"];
        break;
      case "gas":
        fueltechs = [
          "gas_ccgt",
          "gas_ocgt",
          "gas_recip",
          "gas_steam",
          "gas_wcmg",
        ];
        break;
      case "solar":
        fueltechs = ["solar_rooftop", "solar_thermal", "solar_utility"];
        break;
      case "wind":
        fueltechs = ["wind", "wind_offshore"];
        break;
      case "hydro":
        fueltechs = ["hydro"];
        break;
      case "battery":
        fueltechs = ["battery_charging", "battery_discharging"];
        break;
      case "distillate":
        fueltechs = ["distillate"];
        break;
      case "bioenergy":
        fueltechs = ["bioenergy_biogas", "bioenergy_biomass"];
        break;
      case "pumps":
        fueltechs = ["pumps"];
        break;
      default:
        console.warn(`Unknown fueltech type: ${fueltech}`);
        return;
    }

    setFueltechFilter((prev) => {
      const newFilter = { ...prev };
      fueltechs.forEach((ft) => {
        newFilter[ft as keyof FueltechFilter] = checked;
      });
      return newFilter;
    });
  };

  const checkStatusFilter = (status: string, checked: boolean) => {
    setStatusFilter((prev) => ({ ...prev, [status.toLowerCase()]: checked }));
  };

  const facilitiesPage = filterFacilities(facilities).slice(
    page * PAGE_SIZE,
    (page + 1) * PAGE_SIZE
  );

  return (
    <>
      <h1>RenewMap code challenge</h1>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="mr-2">Fuel Type</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Filter by Fuel Type</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuCheckboxItem
            checked={fueltechFilter.coal_black}
            onCheckedChange={(checked) => checkFueltechFilter("Coal", checked)}
          >
            Coal
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={fueltechFilter.gas_ccgt}
            onCheckedChange={(checked) => checkFueltechFilter("Gas", checked)}
          >
            Gas
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={fueltechFilter.solar_rooftop}
            onCheckedChange={(checked) => checkFueltechFilter("Solar", checked)}
          >
            Solar
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={fueltechFilter.wind}
            onCheckedChange={(checked) => checkFueltechFilter("Wind", checked)}
          >
            Wind
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={fueltechFilter.hydro}
            onCheckedChange={(checked) => checkFueltechFilter("Hydro", checked)}
          >
            Hydro
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={fueltechFilter.battery_charging}
            onCheckedChange={(checked) =>
              checkFueltechFilter("Battery", checked)
            }
          >
            Battery
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={fueltechFilter.distillate}
            onCheckedChange={(checked) =>
              checkFueltechFilter("Distillate", checked)
            }
          >
            Distillate
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={fueltechFilter.bioenergy_biogas}
            onCheckedChange={(checked) =>
              checkFueltechFilter("Bioenergy", checked)
            }
          >
            Bioenergy
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={fueltechFilter.pumps}
            onCheckedChange={(checked) => checkFueltechFilter("Pumps", checked)}
          >
            Pumps
          </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="mr-2">Facility Status</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuCheckboxItem
            checked={statusFilter.committed}
            onCheckedChange={(checked) =>
              checkStatusFilter("Committed", checked)
            }
          >
            Committed
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={statusFilter.operating}
            onCheckedChange={(checked) =>
              checkStatusFilter("Operating", checked)
            }
          >
            Operating
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={statusFilter.retired}
            onCheckedChange={(checked) => checkStatusFilter("Retired", checked)}
          >
            Retired
          </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Table className="table-auto w-full">
        <TableHeader>
          <TableRow>
            <TableHead>Code</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Network ID</TableHead>
            <TableHead>Network Region</TableHead>
            <TableHead>Description</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {/* Replace with actual data */}
          {facilitiesPage.map((facility) => (
            <TableRow key={facility.code}>
              <TableCell>{facility.code}</TableCell>
              <TableCell>
                {facility.name}
                <HoverCard>
                  <HoverCardTrigger asChild>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="ml-2 bg-white"
                    >
                      <FcAbout className="size-6" />
                    </Button>
                  </HoverCardTrigger>
                  <HoverCardContent className="w-240" align="start">
                    <div
                      className="text-xs text-gray-700"
                      dangerouslySetInnerHTML={{
                        __html: facility.description,
                      }}
                    ></div>
                  </HoverCardContent>
                </HoverCard>
              </TableCell>
              <TableCell>{facility.network_id}</TableCell>
              <TableCell>{facility.network_region}</TableCell>
              <TableCell className="w-1/2">
                <Table className="text-xs">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Unit Code</TableHead>
                      <TableHead>Fuel Tech ID</TableHead>
                      <TableHead>Status ID</TableHead>
                      <TableHead>Emissions Factor CO2</TableHead>
                      <TableHead>Dispatch Type</TableHead>
                      <TableHead>Capacity Registered (MW)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {facility.units.map((unit, j) => (
                      <TableRow key={j}>
                        <TableCell>{unit.code}</TableCell>
                        <TableCell>{unit.fueltech_id}</TableCell>
                        <TableCell>{unit.status_id}</TableCell>
                        <TableCell>{unit.emissions_factor_co2}</TableCell>
                        <TableCell>{unit.dispatch_type}</TableCell>
                        <TableCell>{unit.capacity_registered}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="flex justify-end mt-4">
        <Button
          onClick={() => {
            paginate(-1);
          }}
          disabled={page === 0}
          className="mr-2"
        >
          Prev
        </Button>
        <Button
          onClick={() => {
            paginate(1);
          }}
          disabled={(page + 1) * PAGE_SIZE >= facilities.length}
        >
          Next
        </Button>
      </div>
    </>
  );
}

export default App;
