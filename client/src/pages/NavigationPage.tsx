import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { HospitalMapSvg } from '../components/map/HospitalMapSvg';
import { FloorSelector } from '../components/map/FloorSelector';
import { NavigationDirections } from '../components/map/NavigationDirections';
import { QRScannerModal } from '../components/map/QRScannerModal';
import { fetchHospitalMap, fetchCheckpoints, calculateRoute } from '../services/api';
import { MapNode, RouteResult } from '../types';
import {
  Compass,
  MapPin,
  Accessibility,
  QrCode,
  RotateCcw,
  Volume2,
  Navigation,
  Info
} from 'lucide-react';
import { speechService } from '../services/speech';

export const NavigationPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [searchParams] = useSearchParams();

  const [currentFloor, setCurrentFloor] = useState(0);
  const [nodes, setNodes] = useState<MapNode[]>([]);
  const [checkpoints, setCheckpoints] = useState<any[]>([]);
  const [startNodeId, setStartNodeId] = useState('N-G-ENTRANCE');
  const [destNodeId, setDestNodeId] = useState('N-G-OPD');
  const [isWheelchair, setIsWheelchair] = useState(false);
  const [routeResult, setRouteResult] = useState<RouteResult | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);

  // Load URL query params if provided
  useEffect(() => {
    const dest = searchParams.get('dest');
    const wc = searchParams.get('wheelchair');
    if (dest) setDestNodeId(dest);
    if (wc === 'true') setIsWheelchair(true);
  }, [searchParams]);

  // Load Map Data
  useEffect(() => {
    const loadData = async () => {
      try {
        const mapData = await fetchHospitalMap('hosp-demo-01');
        setNodes(mapData.nodes || []);
        const cps = await fetchCheckpoints('hosp-demo-01');
        setCheckpoints(cps || []);
      } catch (err) {
        console.error('Error loading map:', err);
      }
    };
    loadData();
  }, []);

  // Recalculate route whenever endpoints or wheelchair mode changes
  useEffect(() => {
    if (!startNodeId || !destNodeId || startNodeId === destNodeId) {
      setRouteResult(null);
      return;
    }

    const computeRoute = async () => {
      try {
        setIsLoading(true);
        const route = await calculateRoute('hosp-demo-01', startNodeId, destNodeId, isWheelchair);
        setRouteResult(route);
        setCurrentStepIndex(0);

        // Auto switch floor to start node floor
        const startNode = nodes.find(n => n.id === startNodeId);
        if (startNode) {
          setCurrentFloor(startNode.floor);
        }
      } catch (err) {
        console.warn('Could not find route:', err);
        setRouteResult(null);
      } finally {
        setIsLoading(false);
      }
    };

    if (nodes.length > 0) {
      computeRoute();
    }
  }, [startNodeId, destNodeId, isWheelchair, nodes]);

  const handleCheckpointScanned = (nodeId: string, floor: number) => {
    setStartNodeId(nodeId);
    setCurrentFloor(floor);
    speechService.speak('Location verified. Route recalculated from current checkpoint.', i18n.language);
  };

  const handleSelectNodeOnMap = (node: MapNode) => {
    // If start is set, set dest; otherwise set start
    if (node.id === startNodeId) return;
    setDestNodeId(node.id);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Banner */}
      <div className="bg-white dark:bg-disha-darkCard p-5 rounded-card border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-0.5">
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Compass className="w-6 h-6 text-disha-lightPrimary dark:text-disha-darkPrimary" />
            <span>{t('navigation.title')}</span>
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {t('navigation.demoHospital')}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Scan Wall QR Checkpoint Button */}
          <button
            onClick={() => setIsQRScannerOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 text-purple-700 dark:text-purple-300 font-bold text-xs border border-purple-200 dark:border-purple-800 transition"
          >
            <QrCode className="w-4 h-4" />
            <span>{t('navigation.scanCheckpoint')}</span>
          </button>

          {/* Floor Switcher */}
          <FloorSelector
            currentFloor={currentFloor}
            onSelectFloor={(f) => setCurrentFloor(f)}
            floorsWithRoute={routeResult?.floorsCovered || []}
          />
        </div>
      </div>

      {/* ROUTE CONTROLS PANEL */}
      <div className="bg-white dark:bg-disha-darkCard p-4 rounded-card border border-gray-200 dark:border-gray-800 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
        {/* Start Point */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span>{t('navigation.startPoint')}</span>
          </label>
          <select
            value={startNodeId}
            onChange={(e) => setStartNodeId(e.target.value)}
            className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-disha-darkBg text-xs font-semibold text-gray-900 dark:text-gray-100"
          >
            {nodes.map(n => (
              <option key={n.id} value={n.id}>
                Floor {n.floor === 0 ? 'G' : n.floor} - {n.name}
              </option>
            ))}
          </select>
        </div>

        {/* Destination Point */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            <span>{t('navigation.destinationPoint')}</span>
          </label>
          <select
            value={destNodeId}
            onChange={(e) => setDestNodeId(e.target.value)}
            className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-disha-darkBg text-xs font-semibold text-gray-900 dark:text-gray-100"
          >
            {nodes.map(n => (
              <option key={n.id} value={n.id}>
                Floor {n.floor === 0 ? 'G' : n.floor} - {n.name}
              </option>
            ))}
          </select>
        </div>

        {/* Wheelchair Accessible Toggle */}
        <div className="flex items-center justify-between md:justify-end gap-3 pt-2 md:pt-4">
          <div className="flex items-center gap-2">
            <Accessibility className={`w-4 h-4 ${isWheelchair ? 'text-teal-600 dark:text-teal-400' : 'text-gray-400'}`} />
            <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
              Wheelchair Route
            </span>
          </div>

          <button
            onClick={() => setIsWheelchair(!isWheelchair)}
            className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
              isWheelchair ? 'bg-disha-lightPrimary dark:bg-disha-darkPrimary justify-end' : 'bg-gray-300 dark:bg-gray-700 justify-start'
            }`}
          >
            <div className="w-4 h-4 rounded-full bg-white shadow-md" />
          </button>
        </div>
      </div>

      {/* MAP + DIRECTIONS DUAL LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interactive SVG Hospital Map Canvas (2 cols) */}
        <div className="lg:col-span-2">
          <HospitalMapSvg
            currentFloor={currentFloor}
            nodes={nodes}
            selectedStartNodeId={startNodeId}
            selectedDestNodeId={destNodeId}
            routeResult={routeResult}
            currentStepIndex={currentStepIndex}
            onSelectNode={handleSelectNodeOnMap}
          />
        </div>

        {/* Step-by-Step Directions Card (1 col) */}
        <div className="lg:col-span-1">
          {routeResult ? (
            <NavigationDirections
              route={routeResult}
              currentStepIndex={currentStepIndex}
              onStepChange={(idx) => setCurrentStepIndex(idx)}
              onFloorChangeRequired={(flr) => setCurrentFloor(flr)}
            />
          ) : (
            <div className="bg-white dark:bg-disha-darkCard rounded-card p-6 border border-gray-200 dark:border-gray-800 shadow-sm text-center space-y-3">
              <Navigation className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto" />
              <h3 className="font-bold text-sm text-gray-800 dark:text-gray-200">
                Select Destination to Route
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                Choose start and destination locations above or tap directly on any room in the hospital map.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* QR Checkpoint Scanner Modal */}
      <QRScannerModal
        isOpen={isQRScannerOpen}
        onClose={() => setIsQRScannerOpen(false)}
        checkpoints={checkpoints}
        onCheckpointScanned={handleCheckpointScanned}
      />
    </div>
  );
};
