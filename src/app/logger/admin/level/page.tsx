import { logger } from "@/app/lib/logger"

export default function Logger(){
    const level = logger.transports[1].level;  // TODO might just need to pull the redis cache value
    return(
        <div className="w-full">
        <div className="flex w-full items-center justify-between">
          <h1 className="text-2xl font-medium text-white">Current Level: {level}</h1>
        </div>
        
      </div>
    )
}