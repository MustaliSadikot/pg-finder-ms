
import React from "react";
import { Card, CardContent } from "@/components/ui/card";

const OwnerMessage: React.FC = () => {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="text-center p-4 text-muted-foreground">
          You cannot book your own PG.
        </div>
      </CardContent>
    </Card>
  );
};

export default OwnerMessage;
