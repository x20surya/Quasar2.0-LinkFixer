import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function Linkcard({ brokenLinks, checkedLinks }) {
  return (
    <div className="flex flex-col items-center space-y-4 p-4 bg-black min-h-screen w-full">
      <Card className="w-full max-w-4xl bg-black border border-green-500 shadow-xl p-2 rounded-md">
        <CardHeader className="pt-1 pb-1">
          <CardTitle className="text-green-400 text-2xl font-bold text-center">
            Checked Links
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className={`space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white scrollbar-track-black px-2 ${
              checkedLinks.length > 3 ? "max-h-40" : ""
            }`}
          >
            {checkedLinks.map((link, index) => (
              <div
                key={index}
                className="text-green-400 py-1 flex justify-between items-center shadow-md text-lg border-b border-green-500 last:border-b-0"
              >
                <span className="truncate max-w-[65%]">{link.url}</span>
                <span className="font-bold">
                  {link.status} : {link.message}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      <Card className="w-full max-w-4xl bg-black border border-red-500 shadow-xl p-2 rounded-md">
        <CardHeader className="pt-1 pb-1">
          <CardTitle className="text-red-400 text-2xl font-bold text-center">
            Broken Links
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className={`space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white scrollbar-track-black px-2 ${
              brokenLinks.length > 3 ? "max-h-40" : ""
            }`}
          >
            {brokenLinks.map((link, index) => (
              <div
                key={index}
                className="text-red-400 py-1 flex justify-between items-center shadow-md text-lg border-b border-red-500 last:border-b-0"
              >
                <span className="truncate max-w-[65%]">{link.url}</span>
                <span className="font-bold">
                  {link.status} : {link.message}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default Linkcard;
