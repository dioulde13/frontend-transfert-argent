import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'currencyFormat'
})
export class CurrencyFormatPipe implements PipeTransform {

  transform(value: number | string): string {
    if (!value) return '';
    
    let formattedValue = value.toString().replace(/\D/g, '');  // Supprime tout sauf les chiffres
    if (formattedValue.length <= 3) return formattedValue;

    // Ajouter des séparateurs de milliers
    let result = '';
    while (formattedValue.length > 3) {
      result = ',' + formattedValue.slice(-3) + result;
      formattedValue = formattedValue.slice(0, formattedValue.length - 3);
    }

    return formattedValue + result;
  }

}
