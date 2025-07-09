class EmptyLogger {
	protected static instance: EmptyLogger;

	protected constructor() {}

	public static getInstance(): EmptyLogger {
		if (!EmptyLogger.instance) {
			EmptyLogger.instance = new EmptyLogger();
		}
		return EmptyLogger.instance;
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	public setEnabled(_enabled: boolean) {}
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	public log(_message: string) {}
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	public error(_message: string) {}
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	public warn(_message: string) {}
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	public debug(_message: string) {}
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	public info(_message: string) {}
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	public trace(_message: string) {}
}

class Logger extends EmptyLogger {
	protected static instance: Logger;
	protected env: string;

	protected constructor() {
		super();
		this.env = process.env.NODE_ENV ?? 'development';
	}

	public static getInstance(): Logger | EmptyLogger {
		if (process.env.NODE_ENV === 'production') {
			return EmptyLogger.getInstance();
		}

		if (!Logger.instance) {
			Logger.instance = new Logger();
		}
		return Logger.instance;
	}

	public log(message: string) {
		console.log(message);
	}

	public error(message: string) {
		console.error(message);
	}

	public warn(message: string) {
		console.warn(message);
	}

	public debug(message: string) {
		console.debug(message);
	}

	public info(message: string) {
		console.info(message);
	}

	public trace(message: string) {
		console.trace(message);
	}
}

export default Logger;
