import { RouterModule, Routes } from "@angular/router";
import { HomeComponent } from "../pages/home/home.component";
import { LayoutComponent } from "./layout/layout.component";
import { NgModule } from "@angular/core";
import { CarritoComponent } from "../pages/carrito/carrito.component";
import { CatalogoComponent } from "../pages/catalogo/catalogo.component";
import { ProductoComponent } from "../pages/producto/producto.component";
import { LoginComponent } from "../pages/login/login.component";
import { MiCuentaComponent } from "../pages/mi-cuenta/mi-cuenta.component";
import { AuthGuard } from '../auth.guards';
import { LayoutCuentaComponent } from "./layout-cuenta/layout-cuenta.component";
import { PedidoComponent } from "../pages/pedido/pedido.component";
import { LayoutCatalogoComponent } from "./layout-catalogo/layout-catalogo.component";
import { CarritoGuard } from "../carrito.guards";

export const ecommerceRoutes: Routes = [
  {
    path: '', 
    component: LayoutComponent,
    children: [
      { path: '', component: HomeComponent},
      { 
        path: 'carrito', 
        canActivate: [CarritoGuard],
        component: CarritoComponent
      },
      { 
        path: 'catalogo', 
        component: LayoutCatalogoComponent,
        children: [
          { path: '', component: CatalogoComponent }
        ]
      },
      { path: 'producto/:id/:url_slug', component: ProductoComponent},
      { path: 'login', component: LoginComponent},
      { 
        path: 'cliente', 
        component: LayoutCuentaComponent,
        canActivate: [AuthGuard],
        children: [
          { path: 'cuenta', component: MiCuentaComponent },
          { path: 'pedidos', component: PedidoComponent }
        ]
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(ecommerceRoutes)],
  exports: [RouterModule]
})
export class EcommerceRoutingModule { }