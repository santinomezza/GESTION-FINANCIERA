-- CreateTable
CREATE TABLE "arg_invoices" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "clienteId" TEXT,
    "nroFactura" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "fechaEmision" TIMESTAMP(3) NOT NULL,
    "fechaVencimiento" TIMESTAMP(3),
    "subtotal" DECIMAL(15,2),
    "iva" DECIMAL(15,2),
    "importeTotal" DECIMAL(15,2) NOT NULL,
    "condicionFiscal" TEXT,
    "descripcion" TEXT,
    "estadoPago" TEXT NOT NULL DEFAULT 'pendiente',
    "urlArchivo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "arg_invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "arg_clients" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "cuit" TEXT NOT NULL,
    "razonSocial" TEXT NOT NULL,
    "email" TEXT,
    "telefono" TEXT,
    "direccion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "arg_clients_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "arg_invoices_userId_idx" ON "arg_invoices"("userId");

-- CreateIndex
CREATE INDEX "arg_invoices_clienteId_idx" ON "arg_invoices"("clienteId");

-- CreateIndex
CREATE INDEX "arg_clients_userId_idx" ON "arg_clients"("userId");

-- CreateIndex
CREATE INDEX "arg_clients_cuit_idx" ON "arg_clients"("cuit");

-- AddForeignKey
ALTER TABLE "arg_invoices" ADD CONSTRAINT "arg_invoices_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "arg_invoices" ADD CONSTRAINT "arg_invoices_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "arg_clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "arg_clients" ADD CONSTRAINT "arg_clients_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
