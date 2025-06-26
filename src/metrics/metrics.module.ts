// metrics.module.ts
import { Module } from '@nestjs/common';
import { PrometheusModule, makeCounterProvider, makeHistogramProvider } from '@willsoto/nestjs-prometheus';

@Module({
    imports: [PrometheusModule],
    providers: [
        makeCounterProvider({
            name: 'shorturl_created_total',
            help: 'Total of short urls created',
        }),
        makeHistogramProvider({
            name: 'shorturl_execution_time',
            help: 'Execution time of shorturl',
        }),
    ],
    exports: [
        PrometheusModule,
        makeCounterProvider({
            name: 'shorturl_created_total',
            help: 'Total of short urls created',
        }),
        makeHistogramProvider({
            name: 'shorturl_execution_time',
            help: 'Execution time of shorturl',
        }),
    ],
})
export class MetricsModule { }
