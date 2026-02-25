using FluentValidation;
using SmartPocket.Domain;

namespace SmartPocket.Features.Shared.Icons
{
    public class IconDTOValidator : AbstractValidator<IconDTO>
    {
        public IconDTOValidator()
        {
            RuleFor(x => x.Code).NotEmpty();
            RuleFor(x => x.ColorHex).Matches(Icon.ColorHexRegex());
        }
    }
}
