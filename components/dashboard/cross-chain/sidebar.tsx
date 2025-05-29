"use client";

import { Link as LinkIcon, Shield, AlertTriangle } from "lucide-react";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { PairRaw, Bridge } from "@/types/api/cross-chain";

interface Props {
  fromChainIndex: string;
  toChainIndex: string;
  supportedPairs: PairRaw[];
  bridges: Bridge[];
  pairStatusBridges: Bridge[];
}

export default function Sidebar({
  fromChainIndex,
  toChainIndex,
  supportedPairs,
  bridges,
  pairStatusBridges,
}: Props) {
  /* ---------------------------------------------------------------------- */
  /*                              Route pairs                               */
  /* ---------------------------------------------------------------------- */

  const routePairs = supportedPairs.filter(
    (p) =>
      (p.fromChainIndex === fromChainIndex &&
        p.toChainIndex === toChainIndex) ||
      (p.fromChainIndex === toChainIndex && p.toChainIndex === fromChainIndex),
  );

  /* ---------------------------------------------------------------------- */
  /*                          Bridge availability                           */
  /* ---------------------------------------------------------------------- */

  const chainCompatibleBridges = bridges.filter(
    (b) =>
      b.supportedChains.includes(fromChainIndex) &&
      b.supportedChains.includes(toChainIndex),
  );

  const displayBridges =
    pairStatusBridges.length > 0 ? pairStatusBridges : chainCompatibleBridges;

  /* ---------------------------------------------------------------------- */
  /*                                 UI                                     */
  /* ---------------------------------------------------------------------- */

  return (
    <div className="space-y-4">
      {/* Pairs */}
      <Card className="bg-black/20 border-white/10">
        <CardHeader>
          <CardTitle className="text-lg text-white flex items-center gap-2">
            <LinkIcon className="h-5 w-5" /> Route Pairs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {routePairs.length ? (
              routePairs.map((pair) => (
                <div
                  key={pair.pairId}
                  className="p-3 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-lg border border-purple-500/20"
                >
                  <div className="text-white text-sm font-medium">
                    {pair.fromTokenSymbol.toUpperCase()} →{" "}
                    {pair.toTokenSymbol.toUpperCase()}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-white/60">
                <AlertTriangle className="h-6 w-6 mx-auto mb-2" />
                No pairs for this route
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Bridges */}
      <Card className="bg-black/20 border-white/10">
        <CardHeader>
          <CardTitle className="text-lg text-white flex items-center gap-2">
            <Shield className="h-5 w-5" /> Bridges
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {displayBridges.length ? (
              displayBridges.map((b) => (
                <div
                  key={b.bridgeId}
                  className="p-3 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-lg border border-green-500/20"
                >
                  <div className="text-white font-medium">{b.bridgeName}</div>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-white/60">
                No bridges available
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
